Passo a Passo para usar a aplicaçao AgroCRM

1 - Tenha o Docker instalado na maquina.
2 - Na pasta Tm digital rode o comando docker-compose up --build
3 - Digite http://localhost/ no seu navegador e voce estara na pagina de Dashboard
4 - Ao lado tera uma sidebara com 3 icones, representando as telas, caso queira abrir so clicar na > mais abaixo na sidebar.

# Tela de Dashboard

1 - Caso voce nao tenha nenhuma lead criada a pagina te indicara criar uma lead e apertando o botao voce sera direcionado para a tela de Leads.
2 - A tela é mais para mostrar informaçoes como Total de leads, Leads prioritarios e area total. Alem de um grafico de lead por status e mostrar as leads por municipio. Se possuir alguma propriedade cadastrada sera mostrada no mapa um pin na regiao escolhida e a area em ha de acordo com sua escolha na criação de propriedades. Tambem possui um botao "Ver todas" que abre a tela de propriedades. Por ultimo possui as leads prioritarias para mostrar algumas das leads que tem mais de 100ha.

#Tela de Leads

1 - Nessa tela é onde voce cria e visualisa todas as leads. Havera um botao de criar leads que abrira uma modal. Preenchendo todos os campos (Nome, cpf, telefone, email, municipio, area em hectares, status, observaçoes) sera permitido criar a lead. Unico campo que pode ficar vazio é o ultimo de observaçoes.
2 - Existem um filtro de busca por nome, cpf ou email e mais outros dois filtros (Por status e municipio) onde voce pode filtrar por um de cada campo
3 - No card que mostra a lead voce pode clicar no nome da pessoa e sera direcionado para Detalhes da Lead. La é possivel visualizar as informaçoes gerais, o mapa e propriedades daquela lead especifica.

#Tela de propriedade (Muito importante, nao é possivel cadastrar propriedade se nao houver ao menos uma lead cadastrada)

1 - Nessa tela é onde voce cria e visualisa todas as propriedades cadastradas. Havera um botao de criar Nova propriedade que abrira uma modal. Essa modal tem duas parte a primeira voce preenche os campos (Lead, Nome, Municipio, Cultura, Observaçoes)
e na segunda voce cadastra a localização da sua propriedade atraves de um mapa. Havera dois botoes (Desenhar area e inserir pin). Voce podera desenhar a area de sua propriedade ou inserir um pin e um valor referente a hectares.
