local QBCore = nil
pcall(function()
  QBCore = exports['qb-core']:GetCoreObject()
end)

RegisterNetEvent('livebase:inventory:use', function(data)
  local src = source
  -- Server owns item state. Preview/dev always acknowledges.
  TriggerClientEvent('livebase:inventory:result', src, { ok = true, item = data and data.item })
end)

RegisterNetEvent('livebase:admin:action', function(_)
  local src = source
  local allowed = false
  if QBCore then
    local Player = QBCore.Functions.GetPlayer(src)
    allowed = Player and QBCore.Functions.HasPermission(src, 'admin') or false
  end
  if not allowed then
    TriggerClientEvent('livebase:admin:result', src, { ok = false, error = 'unauthorized' })
    return
  end
  TriggerClientEvent('livebase:admin:result', src, { ok = true })
end)
