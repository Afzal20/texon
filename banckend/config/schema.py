import graphene
import orders.schema
import production.schema

class Query(orders.schema.Query, production.schema.Query, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query)
