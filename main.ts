// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace } from "cdktf";
import * as google from '@cdktf/provider-google';

const project = 'silver-eureka';
const region = 'us-central1';
const repository = 'silver-eureka';

const blankWorkflow = `---
main:
  steps:
    - placeholder: {}
`;

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new google.provider.GoogleProvider(this, 'google', {
      project,
      region,
    });

    const runner = new google.serviceAccount.ServiceAccount(this, 'runner', {
      accountId: 'runner',
    });

    new google.artifactRegistryRepository.ArtifactRegistryRepository(this, 'registry', {
      format: 'docker',
      location: region,
      repositoryId: 'registry',
    });

    new google.cloudbuildTrigger.CloudbuildTrigger(this, 'trigger', {
      filename: 'cloudbuild.yaml',
      github: {
        owner: 'hsmtkk',
        name: repository,
        push: {
          branch: 'main',
        },
      },
    });

    new google.cloudRunV2Service.CloudRunV2Service(this, 'flight', {
      ingress: 'INGRESS_TRAFFIC_INTERNAL_ONLY',
      location: region,
      name: 'flight',
      template: {
        containers: [{
          env: [{
            name: 'NAME',
            value: 'flight',
          }],
          image: 'us-docker.pkg.dev/cloudrun/container/hello',
          livenessProbe: {
            httpGet: {
              path: '/',
            },
          },
          startupProbe: {
            httpGet: {
              path: '/',
            },
          },
        }],
        scaling: {
          minInstanceCount: 0,
          maxInstanceCount: 1,
        },
        serviceAccount: runner.email,
      },
    });

    new google.cloudRunV2Service.CloudRunV2Service(this, 'hotel', {
      ingress: 'INGRESS_TRAFFIC_INTERNAL_ONLY',
      location: region,
      name: 'hotel',
      template: {
        containers: [{
          env: [{
            name: 'NAME',
            value: 'hotel',
          }],
          image: 'us-docker.pkg.dev/cloudrun/container/hello',
          livenessProbe: {
            httpGet: {
              path: '/',
            },
          },
          startupProbe: {
            httpGet: {
              path: '/',
            },
          },
        }],
        scaling: {
          minInstanceCount: 0,
          maxInstanceCount: 1,
        },
        serviceAccount: runner.email,
      },
    });

    new google.workflowsWorkflow.WorkflowsWorkflow(this, 'saga', {
      name: 'saga',
      region,
      serviceAccount: runner.id,
      sourceContents: blankWorkflow,
    });

    new google.workflowsWorkflow.WorkflowsWorkflow(this, 'tcc', {
      name: 'tcc',
      region,
      serviceAccount: runner.id,
      sourceContents: blankWorkflow,
    });

  }
}

const app = new App();
const stack = new MyStack(app, "silver-eureka");
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "hsmtkkdefault",
  workspaces: new NamedCloudWorkspace("silver-eureka")
});
app.synth();
