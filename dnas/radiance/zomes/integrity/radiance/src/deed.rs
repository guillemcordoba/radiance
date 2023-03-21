use hdi::prelude::*;
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Deed {
    pub title: String,
    pub description: String,
    pub image_hash: EntryHash,
    pub x: u32,
    pub y: u32,
}
pub fn validate_create_deed(
    _action: EntryCreationAction,
    _deed: Deed,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_deed(
    _action: Update,
    _deed: Deed,
    _original_action: EntryCreationAction,
    _original_deed: Deed,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Deeds cannot be updated")))
}
pub fn validate_delete_deed(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_deed: Deed,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Deeds cannot be deleted")))
}
pub fn validate_create_link_all_deeds(
    _action: CreateLink,
    _base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    // Check the entry type for the given action hash
    let action_hash = ActionHash::from(target_address);
    let record = must_get_valid_record(action_hash)?;
    let _deed: crate::Deed = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Linked action must reference an entry"))
            ),
        )?;
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_link_all_deeds(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("AllDeeds links cannot be deleted")))
}
