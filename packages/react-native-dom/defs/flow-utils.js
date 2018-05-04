type _ExtractReturn<B, F: (a: any) => B> = B;
type ExtractReturn<F> = _ExtractReturn<*, F>;

type _ExtractPromise<B, P: Promise<B>> = B;
type ExtractPromise<P> = _ExtractPromise<*, P>;
