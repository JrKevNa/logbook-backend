import { AsyncLocalStorage } from 'async_hooks';

type TenantStore = {
  	tenantId: string;
};

export class TenantContext {
	private static readonly storage = new AsyncLocalStorage<TenantStore>();

	static run(tenantId: string, callback: () => void) {
		this.storage.run({ tenantId }, callback);
	}

	static get(): string | undefined {
		return this.storage.getStore()?.tenantId;
	}
}