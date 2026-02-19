##
🛠️ Comandos Úteis do Docker para o seu dia a dia:
Ver logs do banco (útil se o Nest não conseguir conectar):
docker logs -f mysql-participantes

Parar o banco:
docker-compose stop

Subir novamente:
docker-compose start

Apagar tudo e começar do zero (cuidado, apaga os dados):
docker-compose down -v


git push [nome-remoto] [branch]: Envia seus arquivos e histórico de commits para o servidor escolhido.