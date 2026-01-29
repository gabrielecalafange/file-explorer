from django.urls import path
from .views import FolderChildrenView, FolderPathView

urlpatterns = [
    path("folders/<uuid:folder_id>/children/", FolderChildrenView.as_view()),
    path("folders/<uuid:folder_id>/path/", FolderPathView.as_view()),
]

