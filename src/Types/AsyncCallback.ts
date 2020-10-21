export type AsyncErrorCallback = (error: Error, data: null) => void;

export type AsyncDataCallback<DataType> = (error: null, data: DataType) => void;

export type AsyncCallback<T> = AsyncErrorCallback & AsyncDataCallback<T>;
