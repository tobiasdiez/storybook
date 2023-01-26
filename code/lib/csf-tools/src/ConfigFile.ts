/* eslint-disable no-underscore-dangle */
import fs from 'fs-extra';

import * as t from '@babel/types';

import * as generate from '@babel/generator';

import * as traverse from '@babel/traverse';
import { babelParse } from './babelParse';

const logger = console;

const propKey = (p: t.ObjectProperty) => {
  if (t.isIdentifier(p.key)) return p.key.name;
  if (t.isStringLiteral(p.key)) return p.key.value;
  return null;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _getPath = (path: string[], node: t.Node): t.Node | undefined => {
  if (path.length === 0) {
    return node;
  }
  if (t.isObjectExpression(node)) {
    const [first, ...rest] = path;
    const field = node.properties.find((p: t.ObjectProperty) => propKey(p) === first);
    if (field) {
      return _getPath(rest, (field as t.ObjectProperty).value);
    }
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _getPathProperties = (path: string[], node: t.Node): t.ObjectProperty[] | undefined => {
  if (path.length === 0) {
    if (t.isObjectExpression(node)) {
      return node.properties as t.ObjectProperty[];
    }
    throw new Error('Expected object expression');
  }
  if (t.isObjectExpression(node)) {
    const [first, ...rest] = path;
    const field = node.properties.find((p: t.ObjectProperty) => propKey(p) === first);
    if (field) {
      // FXIME handle spread etc.
      if (rest.length === 0) return node.properties as t.ObjectProperty[];

      return _getPathProperties(rest, (field as t.ObjectProperty).value);
    }
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _findVarInitialization = (identifier: string, program: t.Program) => {
  let init: t.Expression | null | undefined = null;
  let declarations: t.VariableDeclarator[] | null = null;
  program.body.find((node: t.Node) => {
    if (t.isVariableDeclaration(node)) {
      declarations = node.declarations;
    } else if (t.isExportNamedDeclaration(node) && t.isVariableDeclaration(node.declaration)) {
      declarations = node.declaration.declarations;
    }

    return (
      declarations &&
      declarations.find((decl: t.Node) => {
        if (
          t.isVariableDeclarator(decl) &&
          t.isIdentifier(decl.id) &&
          decl.id.name === identifier
        ) {
          init = decl.init;
          return true; // stop looking
        }
        return false;
      })
    );
  });
  return init;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _makeObjectExpression = (path: string[], value: t.Expression): t.Expression => {
  if (path.length === 0) return value;
  const [first, ...rest] = path;
  const innerExpression = _makeObjectExpression(rest, value);
  return t.objectExpression([t.objectProperty(t.identifier(first), innerExpression)]);
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const _updateExportNode = (path: string[], expr: t.Expression, existing: t.ObjectExpression) => {
  const [first, ...rest] = path;
  const existingField = existing.properties.find(
    (p: t.ObjectProperty) => propKey(p) === first
  ) as t.ObjectProperty;
  if (!existingField) {
    existing.properties.push(
      t.objectProperty(t.identifier(first), _makeObjectExpression(rest, expr))
    );
  } else if (t.isObjectExpression(existingField.value) && rest.length > 0) {
    _updateExportNode(rest, expr, existingField.value);
  } else {
    existingField.value = _makeObjectExpression(rest, expr);
  }
};

export class ConfigFile {
  _ast: t.File;

  _code: string;

  _exports: Record<string, t.Expression> = {};

  _exportsObject: t.ObjectExpression;

  _quotes: 'single' | 'double' | undefined;

  fileName?: string;

  hasDefaultExport = false;

  constructor(ast: t.File, code: string, fileName?: string) {
    this._ast = ast;
    this._code = code;
    this.fileName = fileName;
  }

  parse() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    traverse.default(this._ast, {
      ExportDefaultDeclaration: {
        enter({ node, parent }) {
          self.hasDefaultExport = true;
          const decl =
            t.isIdentifier(node.declaration) && t.isProgram(parent)
              ? _findVarInitialization(node.declaration.name, parent)
              : node.declaration;

          if (t.isObjectExpression(decl)) {
            self._exportsObject = decl;
            decl.properties.forEach((p: t.ObjectProperty) => {
              const exportName = propKey(p);
              if (exportName) {
                let exportVal = p.value;
                if (t.isIdentifier(exportVal)) {
                  exportVal = _findVarInitialization(exportVal.name, parent as t.Program);
                }
                self._exports[exportName] = exportVal as t.Expression;
              }
            });
          } else {
            logger.warn(`Unexpected ${JSON.stringify(node)}`);
          }
        },
      },
      ExportNamedDeclaration: {
        enter({ node, parent }) {
          if (t.isVariableDeclaration(node.declaration)) {
            // export const X = ...;
            node.declaration.declarations.forEach((decl) => {
              if (t.isVariableDeclarator(decl) && t.isIdentifier(decl.id)) {
                const { name: exportName } = decl.id;
                let exportVal = decl.init;
                if (t.isIdentifier(exportVal)) {
                  exportVal = _findVarInitialization(exportVal.name, parent as t.Program);
                }
                self._exports[exportName] = exportVal;
              }
            });
          } else {
            logger.warn(`Unexpected ${JSON.stringify(node)}`);
          }
        },
      },
      ExpressionStatement: {
        enter({ node, parent }) {
          if (t.isAssignmentExpression(node.expression) && node.expression.operator === '=') {
            const { left, right } = node.expression;
            if (
              t.isMemberExpression(left) &&
              t.isIdentifier(left.object) &&
              left.object.name === 'module' &&
              t.isIdentifier(left.property) &&
              left.property.name === 'exports'
            ) {
              let exportObject = right;
              if (t.isIdentifier(right)) {
                exportObject = _findVarInitialization(right.name, parent as t.Program);
              }
              if (t.isObjectExpression(exportObject)) {
                self._exportsObject = exportObject;
                exportObject.properties.forEach((p: t.ObjectProperty) => {
                  const exportName = propKey(p);
                  if (exportName) {
                    let exportVal = p.value;
                    if (t.isIdentifier(exportVal)) {
                      exportVal = _findVarInitialization(exportVal.name, parent as t.Program);
                    }
                    self._exports[exportName] = exportVal as t.Expression;
                  }
                });
              } else {
                logger.warn(`Unexpected ${JSON.stringify(node)}`);
              }
            }
          }
        },
      },
    });
    return self;
  }

  getFieldNode(path: string[]) {
    const [root, ...rest] = path;
    const exported = this._exports[root];
    if (!exported) return undefined;
    return _getPath(rest, exported);
  }

  getFieldProperties(path: string[]) {
    const [root, ...rest] = path;
    const exported = this._exports[root];
    if (!exported) return undefined;
    return _getPathProperties(rest, exported);
  }

  getFieldValue(path: string[]) {
    const node = this.getFieldNode(path);
    if (node) {
      const { code } = generate.default(node, {});
      // eslint-disable-next-line no-eval
      const value = (0, eval)(`(() => (${code}))()`);
      return value;
    }
    return undefined;
  }

  setFieldNode(path: string[], expr: t.Expression) {
    const [first, ...rest] = path;
    const exportNode = this._exports[first];
    if (this._exportsObject) {
      _updateExportNode(path, expr, this._exportsObject);
      this._exports[path[0]] = expr;
    } else if (exportNode && t.isObjectExpression(exportNode) && rest.length > 0) {
      _updateExportNode(rest, expr, exportNode);
    } else {
      // create a new named export and add it to the top level
      const exportObj = _makeObjectExpression(rest, expr);
      const newExport = t.exportNamedDeclaration(
        t.variableDeclaration('const', [t.variableDeclarator(t.identifier(first), exportObj)])
      );
      this._exports[first] = exportObj;
      this._ast.program.body.push(newExport);
    }
  }

  /**
   * Returns the name of a node in a given path, supporting the following formats:
   * 1. { framework: 'value' }
   * 2. { framework: { name: 'value', options: {} } }
   */
  /**
   * Returns the name of a node in a given path, supporting the following formats:
   * @example
   * // 1. { framework: 'framework-name' }
   * // 2. { framework: { name: 'framework-name', options: {} }
   * getNameFromPath(['framework']) // => 'framework-name'
   */
  getNameFromPath(path: string[]): string | undefined {
    const node = this.getFieldNode(path);
    if (!node) {
      return undefined;
    }

    return this._getPresetValue(node, 'name');
  }

  /**
   * Returns an array of names of a node in a given path, supporting the following formats:
   * @example
   * const config = {
   *   addons: [
   *     'first-addon',
   *     { name: 'second-addon', options: {} }
   *   ]
   * }
   * // => ['first-addon', 'second-addon']
   * getNamesFromPath(['addons'])
   *
   */
  getNamesFromPath(path: string[]): string[] | undefined {
    const node = this.getFieldNode(path);
    if (!node) {
      return undefined;
    }

    const pathNames: string[] = [];
    if (t.isArrayExpression(node)) {
      node.elements.forEach((element) => {
        pathNames.push(this._getPresetValue(element, 'name'));
      });
    }

    return pathNames;
  }

  /**
   * Given a node and a fallback property, returns a **non-evaluated** string value of the node.
   * 1. { node: 'value' }
   * 2. { node: { fallbackProperty: 'value' } }
   */
  _getPresetValue(node: t.Node, fallbackProperty: string) {
    let value;
    if (t.isStringLiteral(node)) {
      value = node.value;
    } else if (t.isObjectExpression(node)) {
      node.properties.forEach((prop) => {
        // { framework: { name: 'value' } }
        if (
          t.isObjectProperty(prop) &&
          t.isIdentifier(prop.key) &&
          prop.key.name === fallbackProperty
        ) {
          if (t.isStringLiteral(prop.value)) {
            value = prop.value.value;
          }
        }

        // { "framework": { "name": "value" } }
        if (
          t.isObjectProperty(prop) &&
          t.isStringLiteral(prop.key) &&
          prop.key.value === 'name' &&
          t.isStringLiteral(prop.value)
        ) {
          value = prop.value.value;
        }
      });
    }

    if (!value) {
      throw new Error(
        `The given node must be a string literal or an object expression with a "${fallbackProperty}" property that is a string literal.`
      );
    }

    return value;
  }

  removeField(path: string[]) {
    const removeProperty = (properties: t.ObjectProperty[], prop: string) => {
      const index = properties.findIndex(
        (p) =>
          (t.isIdentifier(p.key) && p.key.name === prop) ||
          (t.isStringLiteral(p.key) && p.key.value === prop)
      );
      if (index >= 0) {
        properties.splice(index, 1);
      }
    };
    // the structure of this._exports doesn't work for this use case
    // so we have to manually bypass it here
    if (path.length === 1) {
      let removedRootProperty = false;
      // removing the root export
      this._ast.program.body.forEach((node) => {
        // named export
        if (t.isExportNamedDeclaration(node) && t.isVariableDeclaration(node.declaration)) {
          const decl = node.declaration.declarations[0];
          if (t.isIdentifier(decl.id) && decl.id.name === path[0]) {
            this._ast.program.body.splice(this._ast.program.body.indexOf(node), 1);
            removedRootProperty = true;
          }
        }
        // default export
        if (t.isExportDefaultDeclaration(node) && t.isObjectExpression(node.declaration)) {
          const properties = node.declaration.properties as t.ObjectProperty[];
          removeProperty(properties, path[0]);
          removedRootProperty = true;
        }
        // module.exports
        if (
          t.isExpressionStatement(node) &&
          t.isAssignmentExpression(node.expression) &&
          t.isMemberExpression(node.expression.left) &&
          t.isIdentifier(node.expression.left.object) &&
          node.expression.left.object.name === 'module' &&
          t.isIdentifier(node.expression.left.property) &&
          node.expression.left.property.name === 'exports' &&
          t.isObjectExpression(node.expression.right)
        ) {
          const properties = node.expression.right.properties as t.ObjectProperty[];
          removeProperty(properties, path[0]);
          removedRootProperty = true;
        }
      });
      if (removedRootProperty) return;
    }

    const properties = this.getFieldProperties(path) as t.ObjectProperty[];
    if (properties) {
      const lastPath = path.at(-1);
      removeProperty(properties, lastPath);
    }
  }

  _inferQuotes() {
    if (!this._quotes) {
      // first 500 tokens for efficiency
      const occurrences = (this._ast.tokens || []).slice(0, 500).reduce(
        (acc, token) => {
          if (token.type.label === 'string') {
            acc[this._code[token.start]] += 1;
          }
          return acc;
        },
        { "'": 0, '"': 0 }
      );
      this._quotes = occurrences["'"] > occurrences['"'] ? 'single' : 'double';
    }
    return this._quotes;
  }

  setFieldValue(path: string[], value: any) {
    const quotes = this._inferQuotes();
    let valueNode;
    // we do this rather than t.valueToNode because apparently
    // babel only preserves quotes if they are parsed from the original code.
    if (quotes === 'single') {
      const { code } = generate.default(t.valueToNode(value), { jsescOption: { quotes } });
      const program = babelParse(`const __x = ${code}`);
      traverse.default(program, {
        VariableDeclaration: {
          enter({ node }) {
            if (
              node.declarations.length === 1 &&
              t.isVariableDeclarator(node.declarations[0]) &&
              t.isIdentifier(node.declarations[0].id) &&
              node.declarations[0].id.name === '__x'
            ) {
              valueNode = node.declarations[0].init;
            }
          },
        },
      });
    } else {
      // double quotes is the default so we can skip all that
      valueNode = t.valueToNode(value);
    }
    if (!valueNode) {
      throw new Error(`Unexpected value ${JSON.stringify(value)}`);
    }
    this.setFieldNode(path, valueNode);
  }
}

export const loadConfig = (code: string, fileName?: string) => {
  const ast = babelParse(code);
  return new ConfigFile(ast, code, fileName);
};

export const formatConfig = (config: ConfigFile) => {
  const { code } = generate.default(config._ast, {});
  return code;
};

export const readConfig = async (fileName: string) => {
  const code = (await fs.readFile(fileName, 'utf-8')).toString();
  return loadConfig(code, fileName).parse();
};

export const writeConfig = async (config: ConfigFile, fileName?: string) => {
  const fname = fileName || config.fileName;
  if (!fname) throw new Error('Please specify a fileName for writeConfig');
  await fs.writeFile(fname, await formatConfig(config));
};
