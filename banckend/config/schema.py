import graphene
import orders.schema

class Query(orders.schema.Query, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query)
