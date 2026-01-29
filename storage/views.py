from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Node
from .serializers import NodeSerializer
from .models import Node
from .serializers import NodeSerializer


class FolderChildrenView(APIView):
    """
    Lista os filhos de uma pasta e permite criar arquivos/pastas nela.
    """

    def get(self, request, folder_id):
        nodes = Node.objects.filter(parent_id=folder_id)
        serializer = NodeSerializer(nodes, many=True)
        return Response(serializer.data)

    def post(self, request, folder_id):
        data = request.data.copy()
        data["parent"] = folder_id

        serializer = NodeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FolderPathView(APIView):
    """
    Retorna o caminho (breadcrumb) até a pasta.
    """

    def get(self, request, folder_id):
        try:
            folder = Node.objects.get(id=folder_id)
        except Node.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response(folder.get_path())
