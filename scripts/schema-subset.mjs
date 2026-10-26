import assert from "node:assert/strict";

// Deterministic subset of JSON Schema Draft 2020-12 used by Sceneology's v1 schemas.
// This does not claim to replace a complete standards-conformant schema engine.
export function errorsFor(value, rule, document, location = "$") {
  if(rule.$ref) {
    assert.ok(rule.$ref.startsWith("#/$defs/"));
    const named=rule.$ref.slice(8),resolved=document.$defs?.[named];
    assert.ok(resolved,"Missing schema reference "+named);
    return errorsFor(value,resolved,document,location);
  }
  const out=[],err=reason=>out.push(location+": "+reason);
  if("const" in rule && JSON.stringify(value)!==JSON.stringify(rule.const)) err("const");
  if(rule.enum && !rule.enum.some(v=>JSON.stringify(v)===JSON.stringify(value)))err("enum");
  const t=Array.isArray(value)?"array":value===null?"null":Number.isInteger(value)?"integer":typeof value;
  if(rule.type && t!==rule.type && !(rule.type==="number"&&t==="integer")) {err("type");return out;}
  if(typeof value==="number"){
    if(!Number.isFinite(value))err("finite");
    if(rule.minimum!==undefined && value<rule.minimum)err("minimum");
    if(rule.maximum!==undefined && value>rule.maximum)err("maximum");
    if(rule.exclusiveMinimum!==undefined && value<=rule.exclusiveMinimum)err("exclusiveMinimum");
  }
  if(typeof value==="string"){
    if(rule.minLength!==undefined && value.length<rule.minLength)err("minLength");
    if(rule.pattern && !new RegExp(rule.pattern).test(value))err("pattern");
  }
  if(Array.isArray(value)){
    if(rule.minItems!==undefined && value.length<rule.minItems)err("minItems");
    if(rule.maxItems!==undefined && value.length>rule.maxItems)err("maxItems");
    if(rule.uniqueItems && new Set(value.map(x=>JSON.stringify(x))).size!==value.length)err("uniqueItems");
    if(rule.items)value.forEach((v,i)=>out.push(...errorsFor(v,rule.items,document,location+"["+i+"]")));
  } else if(value && typeof value==="object") {
    for(const required of rule.required||[])if(!(required in value))err("missing "+required);
    for(const [k,v] of Object.entries(value)){
      if(rule.properties?.[k])out.push(...errorsFor(v,rule.properties[k],document,location+"."+k));
      else if(rule.additionalProperties===false)err("extra "+k);
      else if(typeof rule.additionalProperties==="object")out.push(...errorsFor(v,rule.additionalProperties,document,location+"."+k));
    }
  }
  if(rule.oneOf){
    const valid=rule.oneOf.filter(s=>errorsFor(value,s,document,location).length===0).length;
    if(valid!==1)err("oneOf "+valid);
  }
  return out;
}
