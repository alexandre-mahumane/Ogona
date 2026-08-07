import { closeTestResources } from './helpers';

export default async function teardown(): Promise<void> {
  await closeTestResources();
}
