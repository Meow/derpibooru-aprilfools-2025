defmodule PhilomenaWeb.AchievementController do
  use PhilomenaWeb, :controller

  alias Philomena.Games

  plug PhilomenaWeb.RequireUserPlug when action in [:create]

  def index(conn, _params) do
    render(conn, "index.html", title: "Achievements")
  end

  def create(conn, %{"points" => _pts}) do
    conn
    |> put_flash(
      :warning,
      "Your version of the page was outdated, score was not saved. Please submit your score again."
    )
    |> redirect(to: ~p"/achievements")
  end

  def create(conn, %{"version" => "3"} = params) do
    achievements =
      params["achievements"]
      |> String.split(",")
      |> Enum.map(fn i ->
        {int, _} = Integer.parse(i)
        int
      end)

    if validate_achievements(conn.assigns.current_user, achievements) do
      case Games.submit_score(conn.assigns.current_user, %{
             "points" => achs_to_points(achievements)
           }) do
        true ->
          conn
          |> send_resp(201, "")

        _ ->
          conn
          |> send_resp(200, "")
      end
    else
      Games.mark_cheater(conn.assigns.current_user)

      conn
      |> send_resp(406, "")
    end
  end

  def create(conn, _params) do
    conn
    |> put_flash(
      :warning,
      "Your version of the page was outdated, score was not saved. Please submit your score again."
    )
    |> redirect(to: ~p"/achievements")
  end

  defp validate_achievements(user, achievements) do
    ach_count = Enum.count(achievements)
    max_ach = Enum.count(points_list()) - 1
    pts = achs_to_points(achievements)
    now = DateTime.utc_now()
    one_hr = DateTime.add(now, -1, :hour)
    two_hr = DateTime.add(now, -2, :hour)
    six_hr = DateTime.add(now, -6, :hour)
    day = DateTime.add(now, -24, :hour)

    cond do
      Enum.member?(achievements, 11) -> false
      Enum.member?(achievements, 37) -> false
      Enum.member?(achievements, 98) -> false
      Enum.member?(achievements, 111) and pts < 400 -> false
      Enum.member?(achievements, 112) and pts < 900 -> false
      Enum.member?(achievements, 113) and pts < 1500 -> false
      Enum.member?(achievements, 114) and pts < 2500 -> false
      Enum.member?(achievements, 115) and pts < 5000 -> false
      Enum.member?(achievements, 116) and pts < 9000 -> false
      Enum.member?(achievements, 117) and ach_count != 115 -> false
      Enum.member?(achievements, 6) and DateTime.compare(user.created_at, one_hr) == :gt -> false
      Enum.member?(achievements, 7) and DateTime.compare(user.created_at, two_hr) == :gt -> false
      Enum.member?(achievements, 8) and DateTime.compare(user.created_at, six_hr) == :gt -> false
      Enum.member?(achievements, 9) and DateTime.compare(user.created_at, day) == :gt -> false
      Enum.member?(achievements, 104) and user.forum_posts_count < 1 -> false
      Enum.member?(achievements, 105) and user.forum_posts_count < 5 -> false
      Enum.member?(achievements, 106) and user.forum_posts_count < 10 -> false
      Enum.member?(achievements, 107) and user.forum_posts_count < 25 -> false
      Enum.member?(achievements, 108) and user.forum_posts_count < 50 -> false
      Enum.member?(achievements, 109) and user.forum_posts_count < 100 -> false
      Enum.member?(achievements, 97) and user.comments_posted_count < 1 -> false
      Enum.member?(achievements, 99) and user.comments_posted_count < 5 -> false
      Enum.member?(achievements, 100) and user.comments_posted_count < 10 -> false
      Enum.member?(achievements, 101) and user.comments_posted_count < 25 -> false
      Enum.member?(achievements, 102) and user.comments_posted_count < 50 -> false
      Enum.member?(achievements, 103) and user.comments_posted_count < 100 -> false
      Enum.member?(achievements, 28) and user.votes_cast_count < 1 -> false
      Enum.member?(achievements, 29) and user.votes_cast_count < 10 -> false
      Enum.member?(achievements, 30) and user.votes_cast_count < 50 -> false
      Enum.member?(achievements, 31) and user.votes_cast_count < 100 -> false
      Enum.member?(achievements, 91) and user.votes_cast_count < 1000 -> false
      Enum.member?(achievements, 93) and user.votes_cast_count < 10000 -> false
      Enum.member?(achievements, 54) and user.images_favourited_count < 1 -> false
      Enum.member?(achievements, 55) and user.images_favourited_count < 10 -> false
      Enum.member?(achievements, 56) and user.images_favourited_count < 50 -> false
      Enum.member?(achievements, 57) and user.images_favourited_count < 100 -> false
      Enum.member?(achievements, 92) and user.images_favourited_count < 1000 -> false
      Enum.member?(achievements, 94) and user.images_favourited_count < 10000 -> false
      Enum.member?(achievements, 63) and user.metadata_updates_count < 1 -> false
      Enum.member?(achievements, 64) and user.metadata_updates_count < 5 -> false
      Enum.member?(achievements, 65) and user.metadata_updates_count < 20 -> false
      Enum.member?(achievements, 66) and user.metadata_updates_count < 50 -> false
      Enum.member?(achievements, 67) and user.metadata_updates_count < 100 -> false
      Enum.member?(achievements, 95) and user.metadata_updates_count < 250 -> false
      Enum.member?(achievements, 96) and user.metadata_updates_count < 1000 -> false
      ach_count > 115 -> false
      Enum.find(achievements, fn a -> a > max_ach || a < 0 end) != nil -> false
      true -> true
    end
  end

  defp points_list,
    do: [
      5,
      5,
      5,
      10,
      20,
      100,
      500,
      1000,
      2500,
      5000,
      5,
      0,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      10,
      10,
      5,
      5,
      5,
      10,
      20,
      30,
      50,
      10,
      20,
      30,
      50,
      5,
      10,
      20,
      30,
      50,
      0,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      10,
      10,
      15,
      20,
      30,
      50,
      10,
      20,
      30,
      50,
      5,
      5,
      5,
      10,
      5,
      10,
      20,
      30,
      50,
      100,
      5,
      5,
      5,
      10,
      5,
      30,
      50,
      5,
      10,
      0,
      10,
      5,
      10,
      10,
      5,
      5,
      15,
      20,
      30,
      50,
      10,
      5,
      5,
      150,
      150,
      500,
      500,
      250,
      1000,
      5,
      0,
      10,
      15,
      30,
      75,
      150,
      5,
      10,
      15,
      30,
      75,
      150,
      5,
      10,
      20,
      30,
      50,
      100,
      250,
      11020
    ]

  defp ach_to_points(ach) do
    case Enum.at(points_list(), ach) do
      nil -> 0
      n -> n
    end
  end

  defp achs_to_points(achievements) do
    achievements
    |> Enum.map(fn a -> ach_to_points(a) end)
    |> Enum.sum()
  end
end
