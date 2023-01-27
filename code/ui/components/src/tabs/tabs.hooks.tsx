import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { sanitize } from '@storybook/csf';
import { styled } from '@storybook/theming';
import useResizeObserver from 'use-resize-observer';
import { TabButton } from '../bar/button';
import { TooltipLinkList } from '../tooltip/TooltipLinkList';
import { WithTooltip } from '../tooltip/WithTooltip';
import type { ChildrenList } from './tabs.helpers';
import type { Link } from '../tooltip/TooltipLinkList';

const CollapseIcon = styled.span<{ isActive: boolean }>(({ theme, isActive }) => ({
  display: 'inline-block',
  width: 0,
  height: 0,
  marginLeft: 8,
  color: isActive ? theme.color.secondary : theme.color.mediumdark,
  borderRight: '3px solid transparent',
  borderLeft: `3px solid transparent`,
  borderTop: '3px solid',
  transition: 'transform .1s ease-out',
}));

const AddonButton = styled(TabButton)<{ preActive: boolean }>(({ active, theme, preActive }) => {
  return `
    color: ${preActive || active ? theme.color.secondary : theme.color.mediumdark};
    &:hover {
      color: ${theme.color.secondary};
      .addon-collapsible-icon {
        color: ${theme.color.secondary};
      }
    }
  `;
});

export function useList(list: ChildrenList) {
  const tabBarRef = useRef<HTMLDivElement>();
  const addonsRef = useRef<HTMLButtonElement>();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const { width: tabBarWidth = 1 } = useResizeObserver<HTMLDivElement>({
    ref: tabBarRef,
  });

  const [visibleList, setVisibleList] = useState(list);
  const [invisibleList, setInvisibleList] = useState<ChildrenList>([]);
  const previousList = useRef<ChildrenList>(list);

  const AddonTab = useCallback(
    ({
      menuName,
      actions,
    }: {
      menuName: string;
      actions?: {
        onSelect: (id: string) => void;
      } & Record<string, any>;
    }) => {
      const isAddonsActive = invisibleList.some(({ active }) => active);
      const [isTooltipVisible, setTooltipVisible] = useState(false);
      return (
        <>
          <WithTooltip
            interactive
            withArrows={false}
            visible={isTooltipVisible}
            onVisibleChange={setTooltipVisible}
            placement="bottom"
            delayHide={100}
            tooltip={
              <TooltipLinkList
                links={invisibleList.map(({ title, id, color, active }) => {
                  return {
                    id,
                    title,
                    color,
                    active,
                    onClick: (e) => {
                      e.preventDefault();
                      actions.onSelect(id);
                    },
                  } as Link;
                })}
              />
            }
          >
            <AddonButton
              ref={addonsRef}
              active={isAddonsActive}
              preActive={isTooltipVisible}
              style={{ visibility: invisibleList.length ? 'visible' : 'hidden' }}
              className="tabbutton"
              type="button"
              role="tab"
            >
              {menuName}
              <CollapseIcon
                className="addon-collapsible-icon"
                isActive={isAddonsActive || isTooltipVisible}
              />
            </AddonButton>
          </WithTooltip>
          {invisibleList.map(({ title, id, color }) => {
            return (
              <TabButton
                id={`tabbutton-${sanitize(title)}`}
                style={{ visibility: 'hidden' }}
                tabIndex={-1}
                ref={(ref: HTMLButtonElement) => {
                  tabRefs.current.set(title, ref);
                }}
                className="tabbutton"
                type="button"
                key={id}
                textColor={color}
                role="tab"
              >
                {title}
              </TabButton>
            );
          })}
        </>
      );
    },
    [invisibleList]
  );

  const setTabLists = useCallback(() => {
    // get x and width from tabBarRef div
    const { x, width } = tabBarRef.current.getBoundingClientRect();
    const { width: widthAddonsTab } = addonsRef.current.getBoundingClientRect();
    const rightBorder = invisibleList.length ? x + width - widthAddonsTab : x + width;

    const newVisibleList: ChildrenList = [];

    let widthSum = 0;

    const newInvisibleList = list.filter((item) => {
      const { title } = item;
      const tabButton = tabRefs.current.get(title);

      if (!tabButton) {
        return false;
      }
      const { width: tabWidth } = tabButton.getBoundingClientRect();

      const crossBorder = x + widthSum + tabWidth > rightBorder;

      if (!crossBorder) {
        newVisibleList.push(item);
      }

      widthSum += tabWidth;

      return crossBorder;
    });

    if (newVisibleList.length !== visibleList.length || previousList.current !== list) {
      setVisibleList(newVisibleList);
      setInvisibleList(newInvisibleList);
      previousList.current = list;
    }
  }, [invisibleList.length, list, visibleList]);

  useLayoutEffect(setTabLists, [setTabLists, tabBarWidth]);

  return {
    tabRefs,
    addonsRef,
    tabBarRef,
    visibleList,
    invisibleList,
    AddonTab,
  };
}
