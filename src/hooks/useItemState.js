import {
    useRef,
    useContext,
    useEffect
} from 'react';
import {
    ItemSettingsContext,
    MenuListItemContext,
    HoverIndexActionTypes
} from '../utils';


// This hook includes some common stateful logic in MenuItem and FocusableItem
export const useItemState = (ref, index, isHovering, isDisabled) => {
    const { submenuCloseDelay } = useContext(ItemSettingsContext);
    const { isParentOpen, isSubmenuOpen, dispatch } = useContext(MenuListItemContext);
    const timeoutId = useRef();

    const setHover = () => {
        if (!isDisabled) dispatch({ type: HoverIndexActionTypes.SET, index });
    }

    const onBlur = e => {
        // Focus has moved out of the entire item
        // It handles situation such as clicking on a sibling disabled menu item
        if (!e.currentTarget.contains(e.relatedTarget)) {
            dispatch({ type: HoverIndexActionTypes.UNSET, index });
        }
    }

    const onMouseEnter = () => {
        if (isSubmenuOpen) {
            timeoutId.current = setTimeout(setHover, submenuCloseDelay);
        } else {
            setHover();
        }
    }

    const onMouseLeave = (_, keepHover) => {
        timeoutId.current && clearTimeout(timeoutId.current);
        if (!keepHover) dispatch({ type: HoverIndexActionTypes.UNSET, index });
    }

    useEffect(() => () => clearTimeout(timeoutId.current), []);
    useEffect(() => {
        // Don't set focus when parent menu is closed, otherwise focus will be lost
        // and onBlur event will be fired with relatedTarget setting as null.
        if (isHovering && isParentOpen) {
            ref.current && ref.current.focus();
        }
    }, [ref, isHovering, isParentOpen]);

    return {
        setHover,
        onBlur,
        onMouseEnter,
        onMouseLeave
    };
}
