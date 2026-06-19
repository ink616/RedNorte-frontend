# @rednorte/badge

Componente React reutilizable para mostrar un badge visual de estado,
empaquetado como módulo NPM independiente dentro del workspace del
frontend de RedNorte.

## Uso

```jsx
import Badge from '@rednorte/badge';

<Badge estado="AGENDADA" />
```

Por defecto, reconoce los 5 estados de una consulta médica
(`PENDIENTE`, `AGENDADA`, `REASIGNADA`, `CANCELADA`, `ATENDIDA`), con su
clase CSS e ícono correspondiente.

## Reutilización con otro dominio

El componente acepta `classMap` e `iconMap` opcionales, para reutilizarlo
con cualquier otro conjunto de estados (por ejemplo, estados de usuario):

```jsx
import Badge from '@rednorte/badge';

const classMap = { ACTIVO: 'badge-activo', INACTIVO: 'badge-inactivo' };
const iconMap = { ACTIVO: '🟢', INACTIVO: '🔴' };

<Badge estado="ACTIVO" classMap={classMap} iconMap={iconMap} />
```

## Por qué es un paquete separado

Vive en `packages/badge` y se consume desde la app principal vía npm
workspaces (`@rednorte/badge`), en vez de un import relativo
(`../components/Badge`). Esto permite:

- Versionarlo y testearlo de forma independiente del resto del frontend.
- Reutilizarlo en otra app del mismo workspace sin duplicar código.
- Si en el futuro se publica a un registry privado (GitHub Packages,
  Verdaccio), el cambio es transparente para quien lo consume.
