import * as react_jsx_runtime from 'react/jsx-runtime';
import React__default from 'react';

interface ReactiveDomReact {
    top: number;
    left: number;
    right: number;
    width: number;
    height: number;
    elementTop: number;
}

type Props = {
    rect: ReactiveDomReact;
    visible?: boolean;
    hoverHeightRatio?: number;
    hoverWidthRatio?: number;
    activeOpacity?: number;
};
type NativeAttrs = Omit<React__default.HTMLAttributes<any>, keyof Props>;
type HighlightProps = Props & NativeAttrs;
declare function Highlight({ rect, visible, hoverHeightRatio, hoverWidthRatio, activeOpacity, className, ...props }: HighlightProps): react_jsx_runtime.JSX.Element;

export { Highlight, type HighlightProps };
