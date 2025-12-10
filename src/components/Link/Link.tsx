'use client';

import MuiLink from '@mui/material/Link';
import type { LinkProps as MuiLinkProps } from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import * as React from 'react';

// Add support for the sx prop for consistency with the other branches.
const Anchor = styled('a')({});

interface NextLinkComposedProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<
      NextLinkProps,
      'as' | 'href' | 'onClick' | 'onMouseEnter' | 'onTouchStart' | 'passHref'
    > {
  linkAs?: NextLinkProps['as'];
  to: NextLinkProps['href'];
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>((props, ref) => {
  const {
    legacyBehavior = true,
    linkAs,
    locale,
    replace,
    scroll = false,
    shallow,
    to,
    ...other
  } = props;

  return (
    <NextLink
      as={linkAs}
      href={to}
      legacyBehavior={legacyBehavior}
      locale={locale}
      passHref
      prefetch={false}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
    >
      <Anchor ref={ref} {...other} />
    </NextLink>
  );
});

export type LinkProps = Omit<MuiLinkProps, 'href'> &
  Omit<NextLinkComposedProps, 'href' | 'linkAs' | 'to'> & {
    as?: NextLinkProps['as'];
    href: NextLinkProps['href'];
    linkAs?: NextLinkProps['as']; // Useful when the as prop is shallow by styled().
    noLinkStyle?: boolean;
  };

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/pages/api-reference/components/link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const {
    as,
    className,
    href,
    legacyBehavior,
    linkAs: linkAsProp,
    locale,
    noLinkStyle,
    replace,
    scroll,
    shallow,
    ...other
  } = props;

  const isExternal =
    typeof href === 'string' &&
    (href.indexOf('http') === 0 || href.indexOf('mailto:') === 0);

  if (isExternal) {
    if (noLinkStyle) {
      return <Anchor className={className} href={href} ref={ref} {...other} />;
    }

    return <MuiLink className={className} href={href} ref={ref} {...other} />;
  }

  const linkAs = linkAsProp || as;
  const nextjsProps = {
    legacyBehavior,
    linkAs,
    locale,
    prefetch: false,
    replace,
    scroll,
    shallow,
    to: href,
  };

  if (noLinkStyle) {
    return (
      <NextLinkComposed className={className} ref={ref} {...nextjsProps} {...other} />
    );
  }

  return (
    <MuiLink
      className={className}
      component={NextLinkComposed}
      ref={ref}
      {...nextjsProps}
      {...other}
    />
  );
});

export default Link;
