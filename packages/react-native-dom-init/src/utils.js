import * as findUp from 'find-up';

export const isProjectUsingYarn = cwd => {
    return !!findUp.sync('yarn.lock', {cwd});
}