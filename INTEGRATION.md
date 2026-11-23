# liveBase UI — entegrasyon

Repo başlangıçta yalnızca README içeriyordu. Bu paket yeni NUI yüzeyi, Lua köprüsü ve tarayıcı önizlemesini ekler.

## Kaynak haritası

| Ekran | Resource | Veri | Event / callback | Odak | Tuş |
|---|---|---|---|---|---|
| HUD | livebase-ui | client snapshot 200ms | `hud:snapshot`, `hud:delta` | yok | — |
| Telefon | livebase-ui | NUI + QBCore player | `livebase_phone`, `nuiReady` | phone | F1 önerilir |
| Envanter | livebase-ui | `livebase:inventory:use` | `inventory:use` | inventory | F2 |
| Hızlı seçim | livebase-ui | yerel | `ui:open` wheel | wheel | Tab tut |
| Harita / pause | livebase-ui | yerel + native | ESC kapat | pause | ESC |
| NPC diyalog | livebase-ui | mock / görev | close on distance | dialog | E |
| Radyo | livebase-ui | mock | — | yok | — |
| Garaj | livebase-ui | mock QBCore vehicles | — | garage | — |
| Yarış | livebase-ui | mock | — | race | — |
| Admin | livebase-ui | `livebase:admin:action` sunucu yetki | reddet yetkisiz | admin | — |

Telefon, tetris envanter, NPC, görev, avcılık, kenevir, hapishane, lowrider, handling, garaj, domino, yarış, lazer, admin **bu depoda önceden yoktu**. Modüller konfigüre edilene kadar önizleme mock’u ve “desteklenmiyor” yolu kullanılır.

## Kurulum

1. `npm install && npm run build`
2. Resource’u `resources/[livebase]/livebase-ui` altına kopyala
3. `server.cfg`: `ensure qb-core` ardından `ensure livebase-ui`
4. Geri alma: `ensure` satırını kaldır; eski HUD resource’unu yeniden aç

## Komutlar

- `npm run dev` tarayıcı önizleme (mock)
- `npm run typecheck`
- `npm run build`

## FiveM’de doğrulanacaklar (oturum yok)

Senaryo 1–7, 9–10 oyun içi native radar, QBCore para/eşya ve resource restart ister.
Tarayıcıda doğrulananlar: ekranlar, ESC, çift tıklama kilidi, ayarlar,  mock telefon→rota metni, araç HUD bağlam anahtarı.
