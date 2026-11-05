import type { GentleImageFlowSettings } from '../types.js';
import { SetupWizard } from './setup.js';

export function runListCommand(settings: GentleImageFlowSettings): string {
  const reports = SetupWizard.inspectProviders(settings);
  return SetupWizard.formatReportText(reports, settings.defaultModel);
}
