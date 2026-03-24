import {
  createSkillDefinition,
  type SkillDefinition,
  type SkillDefinitionInput,
  type SkillHandler
} from "./skill-contract.ts";
import { validateSkillDefinitionInput } from "./skill-validation.ts";

function cloneSkillDefinition(skill: SkillDefinition): SkillDefinition {
  return {
    ...skill,
    parameters: skill.parameters.map((parameter) => ({ ...parameter })),
    tags: [...skill.tags],
    handler: skill.handler
  };
}

export class InMemorySkillRegistry {
  private readonly skills = new Map<string, SkillDefinition>();

  protected store(skill: SkillDefinition): void {
    this.skills.set(skill.id, cloneSkillDefinition(skill));
  }

  protected read(skillId: string): SkillDefinition | undefined {
    const skill = this.skills.get(skillId);
    return skill ? cloneSkillDefinition(skill) : undefined;
  }

  protected readAll(): SkillDefinition[] {
    return Array.from(this.skills.values(), (skill) => cloneSkillDefinition(skill));
  }

  protected has(skillId: string): boolean {
    return this.skills.has(skillId);
  }
}

export class SkillRegistryStore extends InMemorySkillRegistry {
  register(input: SkillDefinitionInput): SkillDefinition {
    const validation = validateSkillDefinitionInput(input);
    if (!validation.valid) {
      throw new Error(validation.issues.map((issue) => issue.message).join(" "));
    }

    if (this.has(input.id)) {
      throw new Error(`Skill with id "${input.id}" already exists.`);
    }

    const skill = createSkillDefinition(input);
    this.store(skill);
    return this.read(input.id) as SkillDefinition;
  }

  list(): SkillDefinition[] {
    return this.readAll();
  }

  get(skillId: string): SkillDefinition | undefined {
    return this.read(skillId);
  }

  load(skillId: string): SkillHandler | undefined {
    return this.read(skillId)?.handler;
  }
}
