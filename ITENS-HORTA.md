# Itens da horta e troca de cesta

O que criar no admin do Shopify para a troca funcionar.

## 1. Metaobject `item_horta`

**Configurações → Metacampos e metaobjetos → Metaobjetos → Adicionar definição**

Nome: `Item da Horta`

| Campo | Chave | Tipo | Obrigatório |
|---|---|---|---|
| Nome | `nome` | Texto de linha única | sim |
| Unidade | `unidade` | Texto de linha única | sim |
| Grupo | `grupo` | Texto de linha única (lista de opções) | sim |
| Preço base | `preco` | Decimal | sim |
| Disponível esta semana | `disponivel` | Verdadeiro ou falso | sim |
| Foto | `foto` | Arquivo (imagem) | não |

No campo **Grupo**, use validação de lista com exatamente estes valores:

```
Folhas
Temperos e ervas
Raízes
Frutos
```

Ative **Acesso à API de vitrines virtuais** na definição. Sem isso a
consulta volta vazia sem erro, como aconteceu com o metaobject de produtor.

**Unidade** é o que aparece depois do traço no site: "1 maço",
"aprox. 300 g", "½ dúzia", "2 espigas".

## 2. Trocar o tipo dos metacampos da cesta

Hoje `custom.itens_cesta_p`, `_m` e `_g` são **lista de texto**. Passe para
**lista de referências a metaobjeto**, apontando para `item_horta`.

Ganho concreto: ao montar a cesta da semana você escolhe os itens num
seletor, em vez de digitar. Some o risco de "Couve" e "couve " virarem
coisas diferentes.

O código aceita os dois formatos. Enquanto você não migrar, ele casa os
itens pelo nome — então nada quebra no meio do caminho.

## 3. Cadastrar os itens

Da sua tabela de preços. Os grupos são proposta minha, baseados no tipo de
produto e na faixa de preço — **confira antes de cadastrar**, principalmente
a última seção.

### R$ 3,50

| Nome | Grupo |
|---|---|
| Alface | Folhas |
| Agrião | Folhas |
| Almeirão | Folhas |
| Catalonha | Folhas |
| Escarola | Folhas |
| Espinafre | Folhas |
| Açafrão | Temperos e ervas |
| Alecrim | Temperos e ervas |
| Alho-poró | Temperos e ervas |
| Cebolinha | Temperos e ervas |
| Coentro | Temperos e ervas |
| Cheiro-verde | Temperos e ervas |
| Hortelã-pimenta | Temperos e ervas |
| Salsinha | Temperos e ervas |

### R$ 4,00

| Nome | Grupo |
|---|---|
| Acelga | Folhas |
| Couve | Folhas |
| Rúcula | Folhas |
| Manjericão | Temperos e ervas |

### R$ 4,50

| Nome | Grupo |
|---|---|
| Batata-doce | Raízes |
| Beterraba | Raízes |
| Cenoura | Raízes |

### R$ 5,50

| Nome | Grupo |
|---|---|
| Taioba | Folhas |
| Peixinho | Folhas |
| Folhas de beterraba | Folhas |
| Banana | Frutos |
| Milho | Frutos |
| Pimenta | Frutos |
| Tomate | Frutos |

### R$ 5,50 — ervas da segunda coluna

Aqui eu não tenho confiança. Vários nomes são PANCs ou ervas medicinais e
a foto está em baixa resolução — alguns podem ser outra coisa
(Trançagem talvez seja Transagem/Tanchagem; Cavelinha, Cavalinha; Puejo,
Poejo). **Revise nome por nome.**

| Nome na tabela | Grupo sugerido |
|---|---|
| Hortelã | Temperos e ervas |
| Menta | Temperos e ervas |
| Capim-santo | Temperos e ervas |
| Erva-doce | Temperos e ervas |
| Cidreira | Temperos e ervas |
| Poejo | Temperos e ervas |
| Capuchinha | Folhas |
| Begônia | Folhas |
| Capeba | Folhas |
| Trançagem | Temperos e ervas |
| Ramim | Temperos e ervas |
| Betalha | Temperos e ervas |
| Cavelinha | Temperos e ervas |

## 4. Como a regra de troca funciona

Um item pode ser trocado por outro que atenda **todas** estas condições:

1. mesmo **grupo**
2. **preço igual ou menor** que o item que sai
3. **disponível esta semana**
4. ainda **não está na cesta**

Foi assim que o seu exemplo saiu certo: Rúcula (Folhas, R$4,00) pode virar
Agrião, Espinafre ou Almeirão (Folhas, R$3,50).

Esta regra existe para você não precisar manter uma lista de substitutos
para cada um dos 41 itens, e revisá-la toda semana. Marcar "disponível"
nos itens da semana é suficiente — o resto sai sozinho.

Se em algum caso a regra for restritiva demais, o ajuste é mudar o grupo
do item, não escrever exceção no código.

## 5. Trocas por tamanho

| Cesta | Itens | Trocas |
|---|---|---|
| Pequena | 7 | 1 |
| Média | 11 | 2 |
| Grande | 14 | 3 |

## 6. O que chega no pedido

Cada troca vira um atributo da linha do carrinho, então aparece no pedido
do admin e na separação:

```
Cesta Média
Troca 1: Rúcula → Agrião
Troca 2: Cenoura → Beterraba
```

É o formato estruturado que a operação no WhatsApp precisa.
