import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { Construct } from "@aws-cdk/core";
import * as path from "path";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as sfnTask from "@aws-cdk/aws-stepfunctions-tasks";
import * as iam from "@aws-cdk/aws-iam";

export class StepFunctionOpentelStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const codePath = path.join(__dirname, "../lambda-python");

		const openTelLambdaLayer = lambda.LayerVersion.fromLayerVersionArn(
			this,
			"OpenTelLayer",
			"arn:aws:lambda:ap-southeast-2:901920570463:layer:aws-otel-python-amd64-ver-1-16-0:1",
		);

		const commonLambdaFunctionConfig = {
			code: lambda.Code.fromAsset(codePath, {
				bundling: {
					image: lambda.Runtime.PYTHON_3_9.bundlingImage,
					command: ["bash", "-c", "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output"],
				},
			}),
			runtime: lambda.Runtime.PYTHON_3_9,
			architecture: lambda.Architecture.X86_64,
			tracing: lambda.Tracing.ACTIVE,
			layers: [openTelLambdaLayer],
			environment: {
				OPENTELEMETRY_COLLECTOR_CONFIG_FILE: "/var/task/collector.yaml",
				AWS_LAMBDA_EXEC_WRAPPER: "/opt/otel-instrument",
			},
		};

		const step1Function = new lambda.Function(this, "Step1LambdaFunction", {
			...commonLambdaFunctionConfig,
			handler: "step_1.main.lambda_handler",
		});

		const step2Function = new lambda.Function(this, "Step2LambdaFunction", {
			...commonLambdaFunctionConfig,
			handler: "step_2.main.lambda_handler",
		});

		const step3Function = new lambda.Function(this, "Step3LambdaFunction", {
			...commonLambdaFunctionConfig,
			handler: "step_3.main.lambda_handler",
		});

		const step4Function = new lambda.Function(this, "Step4LambdaFunction", {
			...commonLambdaFunctionConfig,
			handler: "step_4.main.lambda_handler",
		});

		const exampleStateMachine = new sfn.StateMachine(this, "ExampleStateMachine", {
			definition: new sfnTask.LambdaInvoke(this, "Step1Task", {
				lambdaFunction: step1Function,
				outputPath: "$.Payload",
			}).next(
				new sfnTask.LambdaInvoke(this, "Step2Task", {
					lambdaFunction: step2Function,
					outputPath: "$.Payload",
				}).next(
					new sfnTask.LambdaInvoke(this, "Step3Task", {
						lambdaFunction: step3Function,
						outputPath: "$.Payload",
					}).next(
						new sfnTask.LambdaInvoke(this, "Step4Task", {
							lambdaFunction: step4Function,
							outputPath: "$.Payload",
						}),
					),
				),
			),
			tracingEnabled: true,
		});
	}
}
