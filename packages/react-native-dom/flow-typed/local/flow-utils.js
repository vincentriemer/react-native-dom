declare type _ExtractReturn<B, F: (a: any) => B> = B;
declare type ExtractReturn<F> = _ExtractReturn<*, F>;

declare type _ExtractPromise<B, P: Promise<B>> = B;
declare type ExtractPromise<P> = _ExtractPromise<*, P>;

type ExtractAsyncModule<R> = $Call<<T>(() => Promise<Class<T>>) => T, R>;
