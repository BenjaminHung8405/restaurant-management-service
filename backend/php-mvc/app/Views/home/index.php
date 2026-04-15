<section class="card">
    <span class="badge">READY</span>
    <h2 style="margin: 14px 0 8px;">MVC structure created</h2>
    <p class="muted" style="margin-top: 0;">
        <?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?>
    </p>

    <ul>
        <li>Controllers: app/Controllers</li>
        <li>Models: app/Models</li>
        <li>Views: app/Views</li>
        <li>Core: app/Core</li>
    </ul>

    <p>
        Environment: <strong><?php echo htmlspecialchars($environment, ENT_QUOTES, 'UTF-8'); ?></strong>
    </p>
</section>
