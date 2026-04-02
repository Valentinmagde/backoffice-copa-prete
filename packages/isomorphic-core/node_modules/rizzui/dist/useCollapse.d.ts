import * as React from 'react';

declare function useCollapse(duration?: number, defaultOpen?: boolean): {
    open: boolean;
    targetEl: React.RefObject<any>;
    openTargetEl: boolean;
    slideUp: (target: any) => void;
    slideDown: (target: any) => void;
    toggle: () => void;
};

export { useCollapse };
