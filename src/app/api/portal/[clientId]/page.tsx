// Latest update link
<a
  href={`/portal/${clientId}/projects/${latestPost.projectId}/posts/${latestPost.postId}`}
>
  View post
</a>

// Recent posts list
<ul>
  {recentPosts.map((post) => (
    <li key={post.postId}>
      <a
        href={`/portal/${clientId}/projects/${post.projectId}/posts/${post.postId}`}
      >
        [{post.projectName}] {post.title}
      </a>
    </li>
  ))}
</ul>
