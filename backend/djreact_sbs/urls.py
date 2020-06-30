"""djreact_sbs URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from accounts.views import *
from BookingSystem.views import *


router = DefaultRouter()
router.register('api/rooms', RoomsView)
router.register('api/bookings', BookingsView)
router.register('api/users', UserView)

urlpatterns = [
    path('api-token-auth/', CustomAuthToken.as_view()),  #login (post)
    path("api/user/register", UserRegisterView.as_view()), #register (post)
    path("api/user/forgotpassword", ForgotPasswordView.as_view()), #generate token (post)
    path("api/user/verifytoken", VerifyResetToken.as_view()),  #verify token (post)
    path("api/user/changepassword", ChangePassword.as_view()),  #reset password (post)

    path("api/user/accountinfo", UserAccountInfo.as_view()),
    path("api/filter/adminfilter/checkadmin/<email>", IsAdmin.as_view()),
    path("api/filter/adminfilter/pending", AdminRequestActionView.as_view()),
    # path("api/filter/adminfilter/autoaction", AutoActionView.as_view()),
    path("api/filter/userfilter/past", UserPastBookingsView.as_view()),
    path("api/filter/userfilter/future", UserFutureBookingsView.as_view()),
    path("api/filter/roomlist/", RoomListView.as_view()),
    path("api/filter/roomfilter/", RoomDetailView.as_view()),
    path("api/allbookings", BookingHistory.as_view()),
    path("api/book/", BookRoomSlotView.as_view()),
    path("api/admindashboard", AdminDashboardStats.as_view()),
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
]
