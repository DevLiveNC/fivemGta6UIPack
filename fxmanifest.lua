fx_version 'cerulean'
game 'gta5'
lua54 'yes'
name 'livebase-ui'
author 'liveBase'
description 'liveBase HUD, telefon, envanter ve menü NUI paketi'
version '1.0.0'

ui_page 'dist/index.html'

files {
  'dist/index.html',
  'dist/assets/*',
}

client_scripts {
  'lua/client.lua',
}

server_scripts {
  'lua/server.lua',
}

dependencies {
  'qb-core',
}
