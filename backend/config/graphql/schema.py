"""
Gateway GraphQL schema: merges the hand-written Orders and Production schemas
(the frontend GraphQL guide contract) with the auto-generated schemas for
every other app in the ERP.
"""

import graphene

from core.graphql import build_mutation_fields, build_query_fields
from orders.graphql_schema import OrdersQuery
from production.graphql_schema import ProductionQuery

def _merge_query_class(cls):
    return {
        name: value
        for name, value in vars(cls).items()
        if not name.startswith("__") and name != "_meta"
    }


_query_fields = {}
_query_fields.update(_merge_query_class(OrdersQuery))
_query_fields.update(_merge_query_class(ProductionQuery))
_query_fields.update(build_query_fields())

Query = type("Query", (graphene.ObjectType,), _query_fields)

_mutation_fields = build_mutation_fields()

Mutation = type("Mutation", (graphene.ObjectType,), _mutation_fields)

schema = graphene.Schema(query=Query, mutation=Mutation)