document.addEventListener('DOMContentLoaded', () => {
    //make side menu responsive for mobile view
    const menuIcon = document.getElementById('menuIcon');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    menuIcon.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        content.classList.toggle('full-width');
    });
    //plugin JQuery which styles tables of users and classes
    $('.data-table').DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        responsive: true,
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' + // Layout for length & search
             '<"row"<"col-sm-12"tr>>' + // Table
             '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>', // Info & pagination
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Search...",
        }
    });
});
