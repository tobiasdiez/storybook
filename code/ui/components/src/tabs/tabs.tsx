import type { FC, MouseEvent, ReactNode } from 'react';
import React, { useMemo, Component, Fragment, memo } from 'react';
import { styled } from '@storybook/theming';
import { sanitize } from '@storybook/csf';

import { Placeholder } from '../placeholder/placeholder';
import { TabButton } from '../bar/button';
import { Side } from '../bar/bar';
import type { ChildrenList } from './tabs.helpers';
import { childrenToList, VisuallyHidden } from './tabs.helpers';
import { useList } from './tabs.hooks';

export interface WrapperProps {
  bordered?: boolean;
  absolute?: boolean;
}

const Wrapper = styled.div<WrapperProps>(
  ({ theme, bordered }) =>
    bordered
      ? {
          backgroundClip: 'padding-box',
          border: `1px solid ${theme.appBorderColor}`,
          borderRadius: theme.appBorderRadius,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }
      : {},
  ({ absolute }) =>
    absolute
      ? {
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }
      : {
          display: 'block',
        }
);

const WrapperChildren = styled.div<{ backgroundColor: string }>(({ theme, backgroundColor }) => ({
  color: theme.barTextColor,
  display: 'flex',
  width: '100%',
  height: 40,
  boxShadow: `${theme.appBorderColor}  0 -1px 0 0 inset`,
  background: backgroundColor ?? theme.barBg,
}));

export const TabBar = styled.div({
  overflow: 'hidden',

  '&:first-of-type': {
    marginLeft: -3,
  },

  whiteSpace: 'nowrap',
  flexGrow: 1,
});

const TabBarSide = styled(Side)({
  flexGrow: 1,
  flexShrink: 1,
  maxWidth: '100%',
});

TabBar.displayName = 'TabBar';

export interface ContentProps {
  absolute?: boolean;
  bordered?: boolean;
}

const Content = styled.div<ContentProps>(
  {
    display: 'block',
    position: 'relative',
  },
  ({ theme }) => ({
    fontSize: theme.typography.size.s2 - 1,
    background: theme.background.content,
  }),
  ({ bordered, theme }) =>
    bordered
      ? {
          borderRadius: `0 0 ${theme.appBorderRadius - 1}px ${theme.appBorderRadius - 1}px`,
        }
      : {},
  ({ absolute, bordered }) =>
    absolute
      ? {
          height: `calc(100% - ${bordered ? 42 : 40}px)`,

          position: 'absolute',
          left: 0 + (bordered ? 1 : 0),
          right: 0 + (bordered ? 1 : 0),
          bottom: 0 + (bordered ? 1 : 0),
          top: 40 + (bordered ? 1 : 0),
          overflow: 'auto',
          [`& > *:first-child`]: {
            position: 'absolute',
            left: 0 + (bordered ? 1 : 0),
            right: 0 + (bordered ? 1 : 0),
            bottom: 0 + (bordered ? 1 : 0),
            top: 0 + (bordered ? 1 : 0),
            height: `calc(100% - ${bordered ? 2 : 0}px)`,
            overflow: 'auto',
          },
        }
      : {}
);

export interface TabWrapperProps {
  active: boolean;
  render?: () => JSX.Element;
  children?: ReactNode;
}

export const TabWrapper: FC<TabWrapperProps> = ({ active, render, children }) => (
  <VisuallyHidden active={active}>{render ? render() : children}</VisuallyHidden>
);

export const panelProps = {};

export interface TabsProps {
  children?: FuncChildren[] | ReactNode;
  id?: string;
  tools?: ReactNode;
  selected?: string;
  actions?: {
    onSelect: (id: string) => void;
  } & Record<string, any>;
  backgroundColor?: string;
  absolute?: boolean;
  bordered?: boolean;
  menuName: string;
}

export const Tabs: FC<TabsProps> = memo(
  ({
    children,
    selected,
    actions,
    absolute,
    bordered,
    tools,
    backgroundColor,
    id: htmlId,
    menuName,
  }) => {
    const list = useMemo<ChildrenList>(
      () => childrenToList(children, selected),
      [children, selected]
    );

    const { visibleList, tabBarRef, tabRefs, AddonTab } = useList(list);

    return list.length ? (
      <Wrapper absolute={absolute} bordered={bordered} id={htmlId}>
        <WrapperChildren backgroundColor={backgroundColor}>
          <TabBarSide left>
            <TabBar ref={tabBarRef} role="tablist">
              {visibleList.map(({ title, id, active, color }) => {
                return (
                  <TabButton
                    id={`tabbutton-${sanitize(title)}`}
                    ref={(ref: HTMLButtonElement) => {
                      tabRefs.current.set(id, ref);
                    }}
                    className={`tabbutton ${active ? 'tabbutton-active' : ''}`}
                    type="button"
                    key={id}
                    active={active}
                    textColor={color}
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      actions.onSelect(id);
                    }}
                    role="tab"
                  >
                    {title}
                  </TabButton>
                );
              })}
              <AddonTab menuName={menuName} actions={actions} />
            </TabBar>
          </TabBarSide>
          {tools ? <Side right>{tools}</Side> : null}
        </WrapperChildren>
        <Content id="panel-tab-content" bordered={bordered} absolute={absolute}>
          {list.map(({ id, active, render }) => render({ key: id, active }))}
        </Content>
      </Wrapper>
    ) : (
      <Placeholder>
        <Fragment key="title">Nothing found</Fragment>
      </Placeholder>
    );
  }
);
Tabs.displayName = 'Tabs';
(Tabs as any).defaultProps = {
  id: null,
  children: null,
  tools: null,
  selected: null,
  absolute: false,
  bordered: false,
};

type FuncChildren = ({ active }: { active: boolean }) => JSX.Element;

export interface TabsStateProps {
  children: FuncChildren[] | ReactNode;
  initial: string;
  absolute: boolean;
  bordered: boolean;
  backgroundColor: string;
  menuName: string;
}

export interface TabsStateState {
  selected: string;
}

export class TabsState extends Component<TabsStateProps, TabsStateState> {
  static defaultProps: TabsStateProps = {
    children: [],
    initial: null,
    absolute: false,
    bordered: false,
    backgroundColor: '',
    menuName: undefined,
  };

  constructor(props: TabsStateProps) {
    super(props);

    this.state = {
      selected: props.initial,
    };
  }

  handlers = {
    onSelect: (id: string) => this.setState({ selected: id }),
  };

  render() {
    const { bordered = false, absolute = false, children, backgroundColor, menuName } = this.props;
    const { selected } = this.state;
    return (
      <Tabs
        bordered={bordered}
        absolute={absolute}
        selected={selected}
        backgroundColor={backgroundColor}
        menuName={menuName}
        actions={this.handlers}
      >
        {children}
      </Tabs>
    );
  }
}
