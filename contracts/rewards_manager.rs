use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
    Uint128,
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub auto_convert_percentage: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub auto_convert_percentage: Uint128,
    pub owner: String,
}

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let state = State {
        auto_convert_percentage: msg.auto_convert_percentage,
        owner: info.sender.to_string(),
    };
    deps.storage.set(b"state", &to_binary(&state)?);
    Ok(Response::default())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        ExecuteMsg::UpdateAutoConvertPercentage { percentage } => {
            execute_update_percentage(deps, info, percentage)
        }
        ExecuteMsg::CollectAndConvert {} => execute_collect_and_convert(deps, env, info),
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    UpdateAutoConvertPercentage { percentage: Uint128 },
    CollectAndConvert {},
}

pub fn execute_update_percentage(
    deps: DepsMut,
    info: MessageInfo,
    percentage: Uint128,
) -> StdResult<Response> {
    let mut state: State = deps
        .storage
        .get(b"state")
        .ok_or_else(|| cosmwasm_std::StdError::not_found("State"))?;

    if info.sender.to_string() != state.owner {
        return Err(cosmwasm_std::StdError::generic_err("Unauthorized"));
    }

    state.auto_convert_percentage = percentage;
    deps.storage.set(b"state", &to_binary(&state)?);

    Ok(Response::new().add_attribute("action", "update_percentage"))
}

pub fn execute_collect_and_convert(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
) -> StdResult<Response> {
    let state: State = deps
        .storage
        .get(b"state")
        .ok_or_else(|| cosmwasm_std::StdError::not_found("State"))?;

    if info.sender.to_string() != state.owner {
        return Err(cosmwasm_std::StdError::generic_err("Unauthorized"));
    }

    // TODO: Implement actual reward collection and conversion logic
    Ok(Response::new().add_attribute("action", "collect_and_convert"))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetState {} => to_binary(&query_state(deps)?),
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    GetState {},
}

fn query_state(deps: Deps) -> StdResult<State> {
    let state: State = deps
        .storage
        .get(b"state")
        .ok_or_else(|| cosmwasm_std::StdError::not_found("State"))?;
    Ok(state)
}