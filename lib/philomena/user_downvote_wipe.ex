defmodule Philomena.UserDownvoteWipe do
  alias PhilomenaQuery.Batch
  alias PhilomenaQuery.Search
  alias Philomena.Users
  alias Philomena.Users.User
  alias Philomena.Images.Image
  alias Philomena.Images
  alias Philomena.ImageVotes.ImageVote
  alias Philomena.ImageFaves.ImageFave
  alias Philomena.Repo
  import Ecto.Query

  def perform(user_id, upvotes_and_faves_too \\ false) do
    user = Users.get_user!(user_id)

    ImageVote
    |> where(user_id: ^user.id, up: false)
    |> Batch.query_batches(id_field: :image_id)
    |> Enum.each(fn queryable ->
      {_, image_ids} = Repo.delete_all(select(queryable, [i_v], i_v.image_id), timeout: 120_000)

      {count, nil} =
        Repo.update_all(
          where(Image, [i], i.id in ^image_ids),
          [inc: [downvotes_count: -1, score: 1]],
          timeout: 120_000
        )

      Repo.update_all(where(User, id: ^user.id), [inc: [votes_cast_count: -count]],
        timeout: 120_000
      )

      reindex(image_ids)
    end)

    if upvotes_and_faves_too do
      ImageVote
      |> where(user_id: ^user.id, up: true)
      |> Batch.query_batches(id_field: :image_id)
      |> Enum.each(fn queryable ->
        {_, image_ids} = Repo.delete_all(select(queryable, [i_v], i_v.image_id), timeout: 120_000)

        {count, nil} =
          Repo.update_all(
            where(Image, [i], i.id in ^image_ids),
            [inc: [upvotes_count: -1, score: -1]],
            timeout: 120_000
          )

        Repo.update_all(where(User, id: ^user.id), [inc: [votes_cast_count: -count]],
          timeout: 120_000
        )

        reindex(image_ids)
      end)

      ImageFave
      |> where(user_id: ^user.id)
      |> Batch.query_batches(id_field: :image_id)
      |> Enum.each(fn queryable ->
        {_, image_ids} = Repo.delete_all(select(queryable, [i_f], i_f.image_id), timeout: 120_000)

        {count, nil} =
          Repo.update_all(where(Image, [i], i.id in ^image_ids), [inc: [faves_count: -1]],
            timeout: 120_000
          )

        Repo.update_all(where(User, id: ^user.id), [inc: [images_favourited_count: -count]],
          timeout: 120_000
        )

        reindex(image_ids)
      end)
    end
  end

  defp reindex(image_ids) do
    Image
    |> where([i], i.id in ^image_ids)
    |> preload(^Images.indexing_preloads())
    |> Search.reindex(Image)

    # allow time for indexing to catch up
    :timer.sleep(:timer.seconds(10))
  end
end
