import { RunCaseData, TestableFunction } from '@testent/shared-code-processing';
import { createJsTsFuncExecutionInExtProcess } from './createJsTsFuncExecutionInExtProcess';
import { processOutputToOutputChannel } from './shared/processOutputToOutputChannel';

export async function runJsTsFuncInExtProcessPipeStdToOutputChannel({
	testableFunction,
	runCaseData,
	returnOutputForTest,
}: {
	testableFunction: TestableFunction;
	runCaseData: RunCaseData[];
	returnOutputForTest?: true | undefined;
}): Promise<string | undefined> {
	const process = await createJsTsFuncExecutionInExtProcess({
		testableFunction,
		runCaseData,
	});

	const outputResult = await processOutputToOutputChannel(
		process,
		testableFunction.name,
		returnOutputForTest,
	);
	return outputResult;
}
