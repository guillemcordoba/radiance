use hdk::prelude::*;
use radiance_integrity::*;
#[hdk_extern]
pub fn create_deed(deed: Deed) -> ExternResult<Record> {
    let deed_hash = create_entry(&EntryTypes::Deed(deed.clone()))?;
    let record = get(deed_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Deed"))
            ),
        )?;
    let path = Path::from("all_deeds");
    create_link(path.path_entry_hash()?, deed_hash.clone(), LinkTypes::AllDeeds, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_deed(deed_hash: ActionHash) -> ExternResult<Option<Record>> {
    get(deed_hash, GetOptions::default())
}
