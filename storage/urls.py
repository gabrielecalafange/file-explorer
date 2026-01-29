from django.urls import path
from .views import FolderChildrenView

urlpatterns = [
    path("folders/<uuid:folder_id>/children/", FolderChildrenView.as_view()),
]

