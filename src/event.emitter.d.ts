export default class EventEmitter<T extends string> {
    private readonly listeners;
    on(event: T, cb: (...args: any) => void): {
        unregister: () => void;
    };
    off(event: T, cb: (...args: any) => void): void;
    emit(event: T, ...params: any[]): void;
}
