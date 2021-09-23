/**
 * @internal
 * @hidden
 */
export declare type AsyncErrorCallback = (error: Error, data: null) => void;
/**
 * @internal
 * @hidden
 */
export declare type AsyncDataCallback<DataType> = (error: null, data: DataType) => void;
/**
 * @internal
 * @hidden
 */
export declare type AsyncCallback<T> = AsyncErrorCallback & AsyncDataCallback<T>;
/**
 * @internal
 * @hidden
 */
export declare type AsyncErrorOnlyCallback = (error: Error | null) => void;
/**
 * @internal
 * @hidden
 */
export declare type AsyncNoopCallback = () => void;
