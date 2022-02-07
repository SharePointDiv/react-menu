import React, { memo, useContext, useMemo, useRef } from 'react';
import { bool, func } from 'prop-types';
import { useBEM, useFlatStyles, useItemState } from '../hooks';
import {
  attachHandlerProps,
  commonProps,
  safeCall,
  menuClass,
  menuItemClass,
  stylePropTypes,
  validateIndex,
  withHovering,
  EventHandlersContext
} from '../utils';

export const FocusableItem = withHovering(
  memo(function FocusableItem({
    className,
    styles,
    disabled,
    index,
    children,
    isHovering,
    externalRef,
    ...restProps
  }) {
    const isDisabled = !!disabled;
    validateIndex(index, isDisabled, children);
    const ref = useRef(null);
    const { setHover, onBlur, onMouseMove, onMouseLeave } = useItemState(
      ref,
      index,
      isHovering,
      isDisabled
    );
    const { handleClose } = useContext(EventHandlersContext);

    const modifiers = useMemo(
      () =>
        Object.freeze({
          disabled: isDisabled,
          hover: isHovering,
          focusable: true
        }),
      [isDisabled, isHovering]
    );

    const renderChildren = useMemo(
      () =>
        safeCall(children, {
          ...modifiers,
          ref,
          closeMenu: handleClose
        }),
      [children, modifiers, handleClose]
    );

    const handlers = attachHandlerProps(
      {
        onMouseMove,
        onMouseLeave: (e) => onMouseLeave(e, true),
        onFocus: setHover,
        onBlur
      },
      restProps
    );

    return (
      <li
        role="menuitem"
        {...commonProps(isDisabled)}
        {...restProps}
        {...handlers}
        ref={externalRef}
        className={useBEM({ block: menuClass, element: menuItemClass, modifiers, className })}
        style={useFlatStyles(styles, modifiers)}
      >
        {renderChildren}
      </li>
    );
  }),
  'FocusableItem'
);

FocusableItem.propTypes = {
  ...stylePropTypes(),
  disabled: bool,
  children: func
};
