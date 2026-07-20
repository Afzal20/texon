"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createSkillInventory } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "operator_name", label: "Operator name", required: true },
  { name: "production_line", label: "Production line ID", type: "number", required: true, placeholder: "Numeric line ID" },
  { name: "skill_name", label: "Skill name", required: true },
  { name: "skill_level", label: "Skill level", type: "select", options: [{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "expert", label: "Expert" }] },
  { name: "multi_skill", label: "Multi-skill", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  { name: "last_assessed", label: "Last assessed", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewSkillInventoryPage() {
  return <MerchandisingForm module="skill-inventory" title="skill record" fields={fields} onSubmit={(d) => createSkillInventory({ ...d, multi_skill: d.multi_skill === "true" })} />
}
