/*
 * Copyright © 2025 Eidosmedia S.p.a. All rights reserved.
 * Licensed under the terms of the Eidosmedia Software License Agreement.
 * See LICENSE file in project root for terms and conditions.
 */

import React, { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const errorRenderer = ({ error }: { error: any }) => <div>{error.message}</div>;

const ErrorBoundaryContainer: FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <ErrorBoundary FallbackComponent={errorRenderer}>{children}</ErrorBoundary>
);

export default ErrorBoundaryContainer;
