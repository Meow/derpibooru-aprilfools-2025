defmodule PhilomenaWeb.UserAttributionView do
  use PhilomenaWeb, :view

  alias Philomena.Attribution
  alias Philomena.Users
  alias PhilomenaWeb.AvatarGeneratorView
  alias Philomena.Repo

  def anonymous?(object) do
    Attribution.anonymous?(object)
  end

  def name(object) do
    case is_nil(object.user) or anonymous?(object) do
      true -> anonymous_name(object)
      _false -> object.user.name
    end
  end

  def avatar_url(object) do
    case is_nil(object.user) or anonymous?(object) do
      true -> anonymous_avatar_url(anonymous_name(object))
      _false -> user_avatar_url(object)
    end
  end

  def anonymous_name(object, reveal_anon? \\ false) do
    salt = anonymous_name_salt()
    id = Attribution.object_identifier(object)
    user_id = Attribution.best_user_identifier(object)

    {:ok, <<key::size(16)>>} = :pbkdf2.pbkdf2(:sha256, id <> user_id, salt, 100, 2)

    hash =
      key
      |> Integer.to_string(16)
      |> String.pad_leading(4, "0")

    case not is_nil(object.user) and reveal_anon? do
      true -> "#{object.user.name} (##{hash}, hidden)"
      false -> "Background Pony ##{hash}"
    end
  end

  def anonymous_avatar(name, class \\ "avatar--100px") do
    class = Enum.join(["image-constrained", class], " ")

    content_tag :div, class: class do
      AvatarGeneratorView.generated_avatar(name)
    end
  end

  def user_avatar(object, class \\ "avatar--100px")

  def user_avatar(%{user: nil} = object, class),
    do: anonymous_avatar(anonymous_name(object), class)

  def user_avatar(%{user: %{avatar: nil}} = object, class),
    do: anonymous_avatar(object.user.name, class)

  def user_avatar(%{user: %{avatar: avatar}}, class) do
    class = Enum.join(["image-constrained", class], " ")

    content_tag :div, class: class do
      img_tag(avatar_url_root() <> "/" <> avatar)
    end
  end

  def user_avatar_url(%{user: %{avatar: nil}} = object) do
    anonymous_avatar_url(object.user.name)
  end

  def user_avatar_url(%{user: %{avatar: avatar}}) do
    avatar_url_root() <> "/" <> avatar
  end

  def anonymous_avatar_url(name) do
    svg =
      name
      |> AvatarGeneratorView.generated_avatar()
      |> Enum.map_join(&safe_to_string/1)

    "data:image/svg+xml;base64," <> Base.encode64(svg)
  end

  def user_labels(%{user: user}) do
    []
    |> personal_title(user)
    |> secondary_role(user)
    |> staff_role(user)
  end

  def team_data_for_user(user) do
    user = Repo.preload(user, :game_profiles)
    game_profile = Repo.preload(user.game_profiles, :team) |> Enum.at(0)

    %{
      name: if(game_profile.team.id == 1, do: "NLR", else: "SE"),
      icon: if(game_profile.team.id == 1, do: "/nlr.svg", else: "/se.svg"),
      points: game_profile.points,
      style:
        if(game_profile.team.id == 1, do: "game__team_banner--nlr", else: "game__team_banner--se")
    }
  end

  def rank_for_user(%{id: 212_499}), do: "Score: >:V"

  def rank_for_user(user) do
    user = Repo.preload(user, :game_profiles)

    case Users.get_game_profile(user, 2) do
      nil -> "No Score"
      %{rank_override: nil, points: pts} -> "Score: #{pts}"
      %{rank_override: cheat} -> cheat
      _ -> "Error"
    end
  end

  def rank_class_for_user(%{id: 279_549}), do: "rank--trans"
  def rank_class_for_user(%{id: 338_373}), do: "rank--thomas"

  def rank_class_for_user(user) do
    user = Repo.preload(user, :game_profiles)

    case Users.get_game_profile(user, 2) do
      nil -> "rank--none"
      %{rank_override: nil, points: 25000} -> "rank--max"
      %{rank_override: nil, points: pts} when pts >= 10000 -> "rank--afk"
      %{rank_override: nil, points: pts} when pts >= 5000 -> "rank--sweat"
      %{rank_override: nil, points: pts} when pts >= 2500 -> "rank--idk"
      %{rank_override: nil, points: pts} when pts >= 1500 -> "rank--s"
      %{rank_override: nil, points: pts} when pts >= 900 -> "rank--a"
      %{rank_override: nil, points: pts} when pts >= 600 -> "rank--b"
      %{rank_override: nil, points: pts} when pts >= 400 -> "rank--c"
      %{rank_override: nil, points: pts} when pts >= 250 -> "rank--d"
      %{rank_override: nil, points: pts} when pts >= 100 -> "rank--e"
      %{rank_override: nil, points: _pts} -> "rank--f"
      %{rank_override: _cheat} -> "rank--cheater"
      _ -> "rank--none"
    end
  end

  defp personal_title(labels, %{personal_title: t}) do
    case blank?(t) do
      true -> labels
      false -> [{"label--primary", t} | labels]
    end
  end

  defp personal_title(labels, _user), do: labels

  defp secondary_role(labels, %{secondary_role: t}) do
    case blank?(t) do
      true -> labels
      false -> [{"label--warning", t} | labels]
    end
  end

  defp secondary_role(labels, _user), do: labels

  defp staff_role(labels, %{hide_default_role: false, role: "admin", senior_staff: true}),
    do: [{"label--danger", "Head Administrator"} | labels]

  defp staff_role(labels, %{hide_default_role: false, role: "admin"}),
    do: [{"label--danger", "Administrator"} | labels]

  defp staff_role(labels, %{hide_default_role: false, role: "moderator", senior_staff: true}),
    do: [{"label--success", "Senior Moderator"} | labels]

  defp staff_role(labels, %{hide_default_role: false, role: "moderator"}),
    do: [{"label--success", "Moderator"} | labels]

  defp staff_role(labels, %{hide_default_role: false, role: "assistant", senior_staff: true}),
    do: [{"label--purple", "Senior Assistant"} | labels]

  defp staff_role(labels, %{hide_default_role: false, role: "assistant"}),
    do: [{"label--purple", "Assistant"} | labels]

  defp staff_role(labels, _user),
    do: labels

  defp avatar_url_root do
    Application.get_env(:philomena, :avatar_url_root)
  end

  defp anonymous_name_salt do
    Application.get_env(:philomena, :anonymous_name_salt)
    |> to_string()
  end
end
