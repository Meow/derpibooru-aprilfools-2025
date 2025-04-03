defmodule Philomena.Games do
  @moduledoc """
  The Users context.
  """

  import Ecto.Query, warn: false
  alias Philomena.Repo

  alias Philomena.Games.{Player, Team}

  def create_player(user, attrs \\ %{"points" => 0}) do
    %Player{}
    |> Player.changeset(attrs, user)
    |> Repo.insert()
  end

  def get_player(user, game_id) do
    Enum.find(
      Repo.preload(user, :game_profiles).game_profiles,
      fn gp ->
        gp.game_id == game_id
      end
    )
  end

  defp maybe_create_player(%{game_profiles: game_profiles} = user) do
    case Enum.find(game_profiles, fn gp -> gp.game_id == 2 end) do
      nil ->
        {:ok, profile} = create_player(user)
        profile

      profile ->
        profile
    end
  end

  def submit_score(user, attrs) do
    user = Repo.preload(user, :game_profiles)
    profile = maybe_create_player(user)

    if !profile.rank_override and profile.points < attrs["points"] do
      profile
      |> Player.points_changeset(attrs)
      |> Repo.update()

      true
    else
      false
    end
  end

  def mark_cheater(user) do
    profile =
      user
      |> Repo.preload(:game_profiles)
      |> maybe_create_player()

    if profile.points != -1 do
      profile
      |> Player.cheater_changeset(%{"points" => "-1", "rank_override" => "CHEATER"})
      |> Repo.update()
    end
  end

  def team_scores do
    Team
    |> order_by(asc: :id)
    |> Repo.all()
    |> Enum.map(fn t -> t.points end)
  end
end
