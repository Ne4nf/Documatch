import {
  DefinitionNotFoundError,
  DocumentNotFoundError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  OrganizationNotFoundError,
  UserNotFoundError,
} from '@/services/api/errors';

import ErrorPage403 from './403';
import ErrorPage404 from './404';
import ErrorPage500 from './500';
import ConnectionError from './ConnectionError';
import GeneralError from './GeneralError';

function ErrorPage({ error }: { error: Error }) {
  if (error.toString().startsWith('TypeError')) {
    return <ConnectionError errorMessage={error.toString()} />;
  }

  if (
    error instanceof DocumentNotFoundError ||
    error instanceof DefinitionNotFoundError ||
    error instanceof UserNotFoundError ||
    error instanceof OrganizationNotFoundError ||
    error instanceof NotFoundError
  ) {
    return <ErrorPage404 errorMessage={error.toString()} />;
  }

  if (error instanceof ForbiddenError) {
    return <ErrorPage403 errorMessage={error.toString()} />;
  }

  if (error instanceof InternalServerError) {
    return <ErrorPage500 errorMessage={error.toString()} />;
  }

  return <GeneralError errorMessage={error.toString()} />;
}

export default ErrorPage;

export { ErrorPage };
