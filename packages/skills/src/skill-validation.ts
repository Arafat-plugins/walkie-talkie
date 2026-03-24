import type { SkillDefinitionInput, SkillParameterDefinition } from "./skill-contract.ts";

export type SkillValidationIssue = {
  path: string;
  message: string;
};

export type SkillValidationResult =
  | {
      valid: true;
      issues: [];
    }
  | {
      valid: false;
      issues: SkillValidationIssue[];
    };

const ALLOWED_PARAMETER_TYPES = new Set(["string", "number", "boolean", "json"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pushIssue(issues: SkillValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function validateParameter(
  parameter: SkillParameterDefinition,
  index: number,
  issues: SkillValidationIssue[]
): void {
  const path = `parameters[${index}]`;

  if (!isNonEmptyString(parameter.name)) {
    pushIssue(issues, `${path}.name`, "Skill parameter name must be a non-empty string.");
  }

  if (!ALLOWED_PARAMETER_TYPES.has(parameter.type)) {
    pushIssue(issues, `${path}.type`, "Skill parameter type is invalid.");
  }

  if (typeof parameter.required !== "boolean") {
    pushIssue(issues, `${path}.required`, "Skill parameter required must be a boolean.");
  }
}

export function validateSkillDefinitionInput(input: SkillDefinitionInput): SkillValidationResult {
  const issues: SkillValidationIssue[] = [];

  if (!isNonEmptyString(input.id)) {
    pushIssue(issues, "id", "Skill id must be a non-empty string.");
  }

  if (!isNonEmptyString(input.name)) {
    pushIssue(issues, "name", "Skill name must be a non-empty string.");
  }

  if (typeof input.handler !== "function") {
    pushIssue(issues, "handler", "Skill handler must be a function.");
  }

  const seenParameterNames = new Set<string>();
  for (const [index, parameter] of (input.parameters ?? []).entries()) {
    validateParameter(parameter, index, issues);

    if (isNonEmptyString(parameter.name)) {
      if (seenParameterNames.has(parameter.name)) {
        pushIssue(
          issues,
          `parameters[${index}].name`,
          `Duplicate skill parameter name "${parameter.name}" is not allowed.`
        );
      }
      seenParameterNames.add(parameter.name);
    }
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issues
    };
  }

  return {
    valid: true,
    issues: []
  };
}
