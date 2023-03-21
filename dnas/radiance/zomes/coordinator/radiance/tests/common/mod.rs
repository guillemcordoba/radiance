use hdk::prelude::*;
use holochain::sweettest::*;

use radiance_integrity::*;



pub async fn sample_deed_1(conductor: &SweetConductor, zome: &SweetZome) -> Deed {
    Deed {
	  title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
	  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
	  image_hash: ::fixt::fixt!(EntryHash),
	  x: 10,
	  y: 10,
    }
}

pub async fn sample_deed_2(conductor: &SweetConductor, zome: &SweetZome) -> Deed {
    Deed {
	  title: "Lorem ipsum 2".to_string(),
	  description: "Lorem ipsum 2".to_string(),
	  image_hash: ::fixt::fixt!(EntryHash),
	  x: 3,
	  y: 3,
    }
}

pub async fn create_deed(conductor: &SweetConductor, zome: &SweetZome, deed: Deed) -> Record {
    let record: Record = conductor
        .call(zome, "create_deed", deed)
        .await;
    record
}

