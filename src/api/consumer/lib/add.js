/** @flow */
import fs from 'fs-extra';
import type { PathOsBased } from '../../../utils/path';
import AddComponents from '../../../consumer/component-ops/add-components';
import type { AddProps, AddActionResults } from '../../../consumer/component-ops/add-components/add-components';
import { loadConsumer, Consumer } from '../../../consumer';

export async function addAction(addProps: AddProps): Promise<AddActionResults> {
  const consumer: Consumer = await loadConsumer();
  const addComponents = new AddComponents(consumer, addProps);
  const addResults = await addComponents.add();
  await consumer.onDestroy();
  return addResults;
}

export async function addMany(components: Object): Promise<AddActionResults[]> {
  const consumer: Consumer = await loadConsumer();
  const componentsDefinitions = components.components;
  const addComponentsArr = [];
  componentsDefinitions.forEach((componentDefinition) => {
    const normalizedPaths: PathOsBased[] = componentDefinition.paths;
    const addProps = {
      componentPaths: normalizedPaths,
      id: componentDefinition.id,
      main: componentDefinition.main,
      tests: componentDefinition.tests ? componentDefinition.tests.map(testFile => testFile.trim()) : [],
      namespace: componentDefinition.namespae,
      exclude: componentDefinition.exclude ? componentDefinition.exclude : [],
      override: componentDefinition.override
    };
    const addComponents = new AddComponents(consumer, addProps);
    addComponentsArr.push(addComponents);
  });
  const addResults = [];
  await Promise.all(
    addComponentsArr.map(async function (addComponents) {
      const addResultsSingle = await addComponents.add();
      addResults.push(addResultsSingle);
    })
  );
  await consumer.onDestroy();
  return addResults;
}
