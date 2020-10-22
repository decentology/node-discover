/**
 * @internal
 * @hidden
 */
export type AsyncErrorCallback = (error: Error, data: null) => void;

/**
 * @internal
 * @hidden
 */
export type AsyncDataCallback<DataType> = (error: null, data: DataType) => void;

/**
 * @internal
 * @hidden
 */
export type AsyncCallback<T> = AsyncErrorCallback & AsyncDataCallback<T>;

/**
 * @internal
 * @hidden
 */
export type AsyncErrorOnlyCallback = (error: Error | null) => void;

/**
 * @internal
 * @hidden
 */
export type AsyncNoopCallback = () => void;
