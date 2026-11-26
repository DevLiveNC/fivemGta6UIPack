local uiOpen = false
local focusOwner = nil

local function push(msgType, payload)
  SendNUIMessage({ v = 1, type = msgType, payload = payload })
end

local function snapshot()
  local ped = PlayerPedId()
  return {
    health = GetEntityHealth(ped),
    armour = GetPedArmour(ped),
    inVehicle = IsPedInAnyVehicle(ped, false),
    heading = GetEntityHeading(ped),
    street = 'unknown',
  }
end

RegisterNUICallback('nuiReady', function(_, cb)
  push('hud:snapshot', snapshot())
  cb({ ok = true })
end)

RegisterNUICallback('close', function(_, cb)
  uiOpen = false
  focusOwner = nil
  SetNuiFocus(false, false)
  cb({ ok = true })
end)

RegisterNUICallback('inventory:use', function(data, cb)
  TriggerServerEvent('livebase:inventory:use', data)
  cb({ ok = true, pending = true })
end)

RegisterNUICallback('admin:action', function(data, cb)
  TriggerServerEvent('livebase:admin:action', data)
  cb({ ok = false, error = 'server_authority' })
end)

CreateThread(function()
  while true do
    Wait(200)
    if not uiOpen then
      push('hud:delta', snapshot())
    end
  end
end)

RegisterCommand('livebase_phone', function()
  uiOpen = true
  focusOwner = 'phone'
  SetNuiFocus(true, true)
  push('ui:open', 'phone')
end, false)

RegisterCommand('livebase_inv', function()
  uiOpen = true
  focusOwner = 'inventory'
  SetNuiFocus(true, true)
  push('ui:open', 'inventory')
end, false)

AddEventHandler('onResourceStop', function(res)
  if res ~= GetCurrentResourceName() then return end
  SetNuiFocus(false, false)
end)

AddEventHandler('gameEventTriggered', function(name)
  if name == 'CEventNetworkEntityDamage' then
    -- death cleanup
  end
end)
