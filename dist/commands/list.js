import { SetupWizard } from './setup.js';
export function runListCommand(settings) {
    const reports = SetupWizard.inspectProviders(settings);
    return SetupWizard.formatReportText(reports, settings.defaultModel);
}
//# sourceMappingURL=list.js.map